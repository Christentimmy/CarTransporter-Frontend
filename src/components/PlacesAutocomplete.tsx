import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { CreateShipmentLocation } from "@/types/shipment";

interface LocationIqSuggestion {
  place_id: string;
  display_name: string;
}

type GoogleMapsLike = {
  maps: {
    places: {
      AutocompleteService: new () => {
        getPlacePredictions: (
          request: { input: string },
          callback: (
            predictions: Array<{ place_id: string; description: string }> | null,
            status: unknown,
          ) => void,
        ) => void;
      };
      PlacesService: new (container: HTMLElement) => {
        getDetails: (
          request: {
            placeId: string;
            fields: string[];
          },
          callback: (
            place: {
              formatted_address?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
              geometry?: { location?: { lat: () => number; lng: () => number } };
            } | null,
            status: unknown,
          ) => void,
        ) => void;
      };
      PlacesServiceStatus: Record<string, unknown>;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsLike;
  }
}

let googlePlacesScriptPromise: Promise<void> | null = null;

function loadGooglePlacesScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (googlePlacesScriptPromise) return googlePlacesScriptPromise;

  const apiKey =
    (import.meta.env.VITE_GOOGLE_API_KEY as string | undefined) ||
    (import.meta.env.GOOGLE_API_KEY as string | undefined);

  if (!apiKey) {
    googlePlacesScriptPromise = Promise.reject(
      new Error("Missing Google Maps API key"),
    );
    return googlePlacesScriptPromise;
  }

  googlePlacesScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-google-maps="places"]',
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "places";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return googlePlacesScriptPromise;
}

function placeToLocation(place: {
  formatted_address?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry?: { location?: { lat: () => number; lng: () => number } };
}): CreateShipmentLocation {
  const components = place.address_components ?? [];

  const getComponent = (type: string) =>
    components.find((c) => c.types.includes(type));

  const streetNumber = getComponent("street_number")?.long_name;
  const route = getComponent("route")?.long_name;
  const postalCode = getComponent("postal_code")?.long_name;
  const locality =
    getComponent("locality")?.long_name ||
    getComponent("postal_town")?.long_name ||
    getComponent("sublocality")?.long_name;
  const admin1 =
    getComponent("administrative_area_level_1")?.short_name ||
    getComponent("administrative_area_level_1")?.long_name;
  const country = getComponent("country")?.long_name;

  const lat = place.geometry?.location?.lat?.() ?? 0;
  const lng = place.geometry?.location?.lng?.() ?? 0;

  const fallbackAddressParts = [streetNumber, route, locality, admin1, postalCode, country]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    type: "Point",
    coordinates: [lng, lat],
    address: (place.formatted_address || fallbackAddressParts || "").trim(),
    city: (locality || "").trim(),
    state: (admin1 || "").trim(),
    country: (country || "").trim(),
    zipCode: (postalCode || "").trim(),
  };
}

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (location: CreateShipmentLocation) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search address...",
  id,
  className,
  disabled,
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationIqSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const detachedPlacesContainerRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<{
    autocomplete: InstanceType<GoogleMapsLike["maps"]["places"]["AutocompleteService"]>;
    places: InstanceType<GoogleMapsLike["maps"]["places"]["PlacesService"]>;
  } | null>(null);
  /** Skip opening dropdown on the next fetch result (user just selected an option) */
  const skipNextOpenRef = useRef(false);

  const debouncedQuery = useDebounce(value.trim(), 300);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q || q.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        await loadGooglePlacesScript();
        if (!window.google?.maps?.places) throw new Error("Google Places not available");

        if (!detachedPlacesContainerRef.current) {
          detachedPlacesContainerRef.current = document.createElement("div");
        }

        if (!servicesRef.current) {
          servicesRef.current = {
            autocomplete: new window.google.maps.places.AutocompleteService(),
            places: new window.google.maps.places.PlacesService(
              detachedPlacesContainerRef.current,
            ),
          };
        }

        const predictions = await new Promise<
          Array<{ place_id: string; description: string }>
        >((resolve) => {
          servicesRef.current?.autocomplete.getPlacePredictions(
            { input: q },
            (p) => resolve(Array.isArray(p) ? p : []),
          );
        });

        setSuggestions(
          predictions.slice(0, 10).map((p) => ({
            place_id: p.place_id,
            display_name: p.description,
          })),
        );
        if (!skipNextOpenRef.current) {
          setIsOpen(true);
        } else {
          skipNextOpenRef.current = false;
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (item: LocationIqSuggestion) => {
    skipNextOpenRef.current = true;
    setIsOpen(false);
    setSuggestions([]);
    onChange(item.display_name);

    try {
      setLoading(true);
      await loadGooglePlacesScript();
      if (!window.google?.maps?.places) throw new Error("Google Places not available");

      if (!detachedPlacesContainerRef.current) {
        detachedPlacesContainerRef.current = document.createElement("div");
      }

      if (!servicesRef.current) {
        servicesRef.current = {
          autocomplete: new window.google.maps.places.AutocompleteService(),
          places: new window.google.maps.places.PlacesService(
            detachedPlacesContainerRef.current,
          ),
        };
      }

      const place = await new Promise<any>((resolve, reject) => {
        servicesRef.current?.places.getDetails(
          {
            placeId: item.place_id,
            fields: ["formatted_address", "address_components", "geometry"],
          },
          (p, status) => {
            const ok = status === "OK" || status === 0;

            if (!ok || !p) {
              reject(new Error("Place details not available"));
              return;
            }
            resolve(p as any);
          },
        );
      });

      const location = placeToLocation(place as any);
      if (!location.address) location.address = item.display_name;
      onChange(location.address);
      onPlaceSelect(location);
    } catch {
      // Ignore; user still has typed value
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
          Searching...
        </div>
      )}
      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              role="option"
              className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
              onMouseDown={() => {
                void handleSelect(item);
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { CreateShipmentLocation } from "@/types/shipment";

const LOCATIONIQ_AUTOCOMPLETE_URL = "https://api.locationiq.com/v1/autocomplete";

/** LocationIQ autocomplete result item (see https://docs.locationiq.com/docs/autocomplete) */
interface LocationIqSuggestion {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  display_place?: string;
  display_address?: string;
  address?: {
    name?: string;
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

function suggestionToLocation(item: LocationIqSuggestion): CreateShipmentLocation {
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  const addr = item.address ?? {};
  const address =
    item.display_name ??
    [addr.house_number, addr.road, addr.city, addr.state, addr.postcode, addr.country]
      .filter(Boolean)
      .join(", ");

  return {
    type: "Point",
    coordinates: [lon, lat],
    address: address || undefined,
    city: addr.city ?? undefined,
    state: addr.state ?? undefined,
    country: addr.country ?? undefined,
    zipCode: addr.postcode ?? undefined,
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
  /** Skip opening dropdown on the next fetch result (user just selected an option) */
  const skipNextOpenRef = useRef(false);

  const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN as string | undefined;
  const debouncedQuery = useDebounce(value.trim(), 300);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!token || !q || q.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          key: token,
          q,
          limit: "10",
        });
        const res = await fetch(`${LOCATIONIQ_AUTOCOMPLETE_URL}?${params}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Autocomplete failed");
        }
        const data: LocationIqSuggestion[] = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
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
    [token]
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

  const handleSelect = (item: LocationIqSuggestion) => {
    skipNextOpenRef.current = true;
    const location = suggestionToLocation(item);
    onChange(location.address ?? item.display_name);
    onPlaceSelect(location);
    setSuggestions([]);
    setIsOpen(false);
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
              onMouseDown={() => handleSelect(item)}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

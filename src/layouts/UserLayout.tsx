import { Outlet, useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Truck,
  FileText,
  User,
  Bell,
  LogOut,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const menuItems = [
  {
    titleKey: "user.layout.menu.dashboard",
    icon: LayoutDashboard,
    url: "/user/dashboard",
  },
  {
    titleKey: "user.layout.menu.postVehicleRequest",
    icon: Truck,
    url: "/user/post-request",
  },
  {
    titleKey: "user.layout.menu.myRequests",
    icon: FileText,
    url: "/user/my-requests",
  },
  // {
  //   title: "Notifications",
  //   icon: Bell,
  //   url: "/user/notifications",
  // },
  {
    titleKey: "user.layout.menu.profile",
    icon: User,
    url: "/user/profile",
  },
];

export const UserLayout = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <SidebarContentWrapper location={location} />
    </SidebarProvider>
  );
};

const SidebarContentWrapper = ({ location }: { location: ReturnType<typeof useLocation> }) => {
  const { setOpenMobile, isMobile } = useSidebar();
  const { t, i18n } = useTranslation();

  const nextLanguage = i18n.language?.startsWith("fr") ? "en" : "fr";
  const languageToggleLabel = i18n.language?.startsWith("fr") ? "EN" : "FR";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/user/dashboard" onClick={handleLinkClick}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Truck className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">BID4TOW</span>
                    <span className="truncate text-xs">{t("user.layout.appSubtitle")}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("user.layout.navigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  const title = t(item.titleKey);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={title}
                      >
                        <Link to={item.url} onClick={handleLinkClick}>
                          <Icon />
                          <span>{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {/* <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("user.layout.backToHome")}>
                <Link to="/" onClick={handleLinkClick}>
                  <Home />
                  <span>{t("user.layout.backToHome")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("user.layout.logout")}>
                <Link to="/login" onClick={handleLinkClick}>
                  <LogOut />
                  <span>{t("user.layout.logout")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => i18n.changeLanguage(nextLanguage)}
            className="bg-background/80 backdrop-blur-xl border border-border/50"
          >
            <Globe className="w-4 h-4 mr-2" />
            {languageToggleLabel}
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </>
  );
};

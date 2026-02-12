import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
  Search,
  Package,
  User,
  Bell,
  LogOut,
  Home,
  Wallet,
  Plus,
  Languages,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth_services";

export const TransporterLayout = () => {
  return (
    <SidebarProvider>
      <TransporterLayoutContent />
    </SidebarProvider>
  );
};

const TransporterLayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { i18n, t } = useTranslation();

  const menuItems = [
    {
      title: t("transporterSidebar.menu.dashboard"),
      icon: LayoutDashboard,
      url: "/transporter/dashboard",
    },
    // {
    //   title: t("transporterSidebar.menu.postRequest"),
    //   icon: Plus,
    //   url: "/transporter/post-request",
    // },
    {
      title: t("transporterSidebar.menu.availableRequests"),
      icon: Search,
      url: "/transporter/available-requests",
    },
    {
      title: t("transporterSidebar.menu.myShipments"),
      icon: Package,
      url: "/transporter/my-shipments",
    },
    {
      title: t("transporterSidebar.menu.withdrawals"),
      icon: Wallet,
      url: "/transporter/withdrawals",
    },
    // {
    //   title: "Notifications",
    //   icon: Bell,
    //   url: "/transporter/notifications",
    // },
    {
      title: t("transporterSidebar.menu.profile"),
      icon: User,
      url: "/transporter/profile",
    },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const handleLogout = async () => {
    await authService.logoutWithServer();
    navigate("/login");
  };

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, location.pathname, setOpenMobile]);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/transporter/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Truck className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{t("transporterSidebar.brand.name")}</span>
                    <span className="truncate text-xs">{t("transporterSidebar.brand.dashboard")}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("transporterSidebar.navigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link to={item.url}>
                          <Icon />
                          <span>{item.title}</span>
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
              <SidebarMenuButton asChild tooltip={t("transporterSidebar.footer.backToHome")}>
                <Link to="/">
                  <Home />
                  <span>{t("transporterSidebar.footer.backToHome")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={t("transporterSidebar.footer.logout")} onClick={handleLogout}>
                <LogOut />
                <span>{t("transporterSidebar.footer.logout")}</span>
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
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Languages className="h-4 w-4" />
            {i18n.language === "en" ? "FR" : "EN"}
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </>
  );
};

import { AppSidebar } from "@beep/todox/components/sidebar";
import { CommandSearch, NavbarUserDropdown, NotificationDropdown } from "@beep/todox/components/navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@beep/todox/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@beep/todox/components/ui/sidebar";

const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/logo.avif",
};

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        {/* Navbar */}
        <header className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 justify-center">
            <CommandSearch />
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <NavbarUserDropdown user={user} />
          </div>
        </header>
        {/* Breadcrumbs */}
        <div className="flex h-10 shrink-0 items-center gap-2 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

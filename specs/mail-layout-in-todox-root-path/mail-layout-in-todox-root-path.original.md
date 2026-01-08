SPEC_NAME: mail-layout-in-todox-root-path

in apps/todox/src/features/mail/view/mail-view.tsx the `MailList` component and `MailDetails` compoennt should be placed in the Main content paenl of apps/todox/src/app/page.tsx:
```tsx
 <div className="flex min-h-0 flex-1">
              <MainContentPanelSidebar fixed={false} />
              <SidebarInset className="bg-sidebar">
                {/* Main content */}
                <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                  <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="bg-muted/50 aspect-video rounded-xl" />
                    <div className="bg-muted/50 aspect-video rounded-xl" />
                    <div className="bg-muted/50 aspect-video rounded-xl" />
                  </div>
                  <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
                </div>
              </SidebarInset>
            </div>
```

the state management in apps/todox/src/components/sidebar/main-content-panel-sidebar.tsx will need to be moved into a new provider component and wrap the relevant `page.tsx` to provide the context.
<div data-orientation="horizontal" role="separator" aria-orientation="horizontal" data-slot="dropdown-menu-separa..." class="bg-border -mx-1 my-1..." />
  in DropdownMenuSeparator (at /home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/ui/dropdown-menu.tsx)
  in DropdownMenuContent (at /home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/ui/dropdown-menu.tsx)
  in DropdownMenu (at /home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/ui/dropdown-menu.tsx)
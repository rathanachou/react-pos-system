import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../components/ui/breadcrumb'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '../components/ui/sidebar'

import { Outlet } from 'react-router-dom'

function DashboardLayout() {
  return (
    <SidebarProvider>
      
      {/* IMPORTANT: add group + sidebar-wrapper */}
      <div className="flex min-h-screen w-full group/sidebar-wrapper">
        
        {/* Sidebar */}
        <AppSidebar />

        {/* Content */}
        <SidebarInset>
          
          {/* HEADER */}
          <header className="flex h-16 items-center gap-2 px-4 transition-all group-data-[collapsible=icon]/sidebar-wrapper:h-12">
            
            <SidebarTrigger />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="hidden md:block" />

                <BreadcrumbItem>
                  <BreadcrumbPage>POS</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

          </header>

          {/* MAIN CONTENT */}
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>

        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout
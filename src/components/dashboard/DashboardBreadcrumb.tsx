
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';

interface BreadcrumbPath {
  name: string;
  path: string;
}

interface DashboardBreadcrumbProps {
  currentPage: string;
  paths?: BreadcrumbPath[];
  hideHome?: boolean;
}

const DashboardBreadcrumb = ({ currentPage, paths = [], hideHome = false }: DashboardBreadcrumbProps) => {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="text-sm text-gray-500">
        {!hideHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center hover:text-gray-700 transition-colors">
                  <HomeIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Início</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {(paths.length > 0 || currentPage !== "Dashboard") && <BreadcrumbSeparator />}
          </>
        )}
        
        {paths.map((path, index) => (
          <React.Fragment key={path.path}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={path.path} className="hover:text-gray-700 transition-colors">
                  {path.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < paths.length - 1 || currentPage !== path.name ? <BreadcrumbSeparator /> : null}
          </React.Fragment>
        ))}
        
        {currentPage !== "Dashboard" && !paths.some(p => p.name === currentPage) && (
          <>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 font-medium">{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DashboardBreadcrumb;

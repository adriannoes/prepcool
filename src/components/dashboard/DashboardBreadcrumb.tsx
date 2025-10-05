
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

interface DashboardBreadcrumbProps {
  currentPage: string;
  parentPage?: {
    name: string;
    path: string;
  };
}

const DashboardBreadcrumb = ({ currentPage, parentPage }: DashboardBreadcrumbProps) => {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <HomeIcon className="h-3.5 w-3.5 mr-1" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        {parentPage && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={parentPage.path}>{parentPage.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DashboardBreadcrumb;

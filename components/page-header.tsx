import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type BreadcrumbItem = {
  name: string;
  href: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
};

export function PageHeader({ title, description, breadcrumbs = [] }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-200/60">
      <div className="container mx-auto px-6 pb-12 max-w-7xl">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center text-sm text-slate-600 mb-6">
            {breadcrumbs.map((item, index) => (
              <div key={item.href} className="flex items-center">
               {index < breadcrumbs.length - 1?  <Link 
                  href={item.href}
                  className="hover:text-red-600 transition-colors font-medium"
                >
                  {item.name}
                </Link>: <span className="text-slate-900 font-medium">{item.name}</span>}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="mx-3 h-4 w-4 text-slate-400" />
                )}
              </div>
            ))}
          </nav>
        )}
        <div className="text-center">
          <h1 className="text-4xl font-medium text-slate-800 tracking-tight mb-4">{title}</h1>
          {description && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

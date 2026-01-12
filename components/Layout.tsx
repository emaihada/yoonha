import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "윤하의 미니홈피" }) => {
  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-cy-blue rounded-xl p-2 sm:p-6 shadow-xl relative ring-1 ring-black/10">
        
        {/* Outer Dot Border Container */}
        <div className="bg-white rounded-lg border-2 border-dashed border-white shadow-inner flex flex-col md:flex-row h-[85vh] md:h-[800px] overflow-hidden">
          
          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto relative flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-cy-orange mb-4 font-pixel tracking-widest border-b-2 border-gray-100 pb-2 flex items-center">
              {title}
            </h1>
            <div className="flex-1">
              {children}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Layout;
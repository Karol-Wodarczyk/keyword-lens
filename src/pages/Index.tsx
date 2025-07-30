import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTab } from '../components/DataTab';

const Index = () => {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto p-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:grid-cols-4 mb-6 bg-gradient-card shadow-glow border border-primary/20 backdrop-blur-sm">
            <TabsTrigger 
              value="data" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-glow"
            >
              Data
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled className="opacity-50">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" disabled className="opacity-50">
              Settings
            </TabsTrigger>
            <TabsTrigger value="export" disabled className="opacity-50">
              Export
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="mt-0">
            <DataTab />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Analytics tab coming soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Settings tab coming soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="mt-0">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Export tab coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

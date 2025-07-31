import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiConfig } from '../services/apiConfig';
import { Database, Globe } from 'lucide-react';

export const ApiStatusIndicator: React.FC = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <Card className="p-3 mb-4 bg-muted/50 border border-primary/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {apiConfig.useMockApi ? (
                        <Database className="h-4 w-4 text-orange-500" />
                    ) : (
                        <Globe className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium">
                        API Mode:
                    </span>
                    <Badge
                        variant={apiConfig.useMockApi ? "secondary" : "default"}
                        className={apiConfig.useMockApi ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}
                    >
                        {apiConfig.apiType}
                    </Badge>
                    {apiConfig.useMockApi && (
                        <span className="text-xs text-muted-foreground">
                            (Using mock data for development)
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        Base URL: {apiConfig.baseUrl}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="h-7 px-2 text-xs"
                    >
                        Refresh
                    </Button>
                </div>
            </div>
            {apiConfig.useMockApi && (
                <div className="mt-2 text-xs text-muted-foreground">
                    💡 To use real API: Set VITE_USE_MOCK_API=false in .env.local or change the configuration in src/services/apiConfig.ts
                </div>
            )}
        </Card>
    );
};

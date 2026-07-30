import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useBack } from '@refinedev/core';

export function AccessDenied() {
    const back = useBack();
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full text-center shadow-lg border-destructive/20">
                <CardHeader className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-bold">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to view or perform this action.
                        If you believe this is an error, please contact your system administrator.
                    </p>
                    <Button variant="outline" className="gap-2" onClick={() => back()}>
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

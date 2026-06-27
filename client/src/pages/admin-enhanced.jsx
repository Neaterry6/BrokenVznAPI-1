import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminEnhanced() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel Removed</CardTitle>
          <CardDescription>The admin panel and admin login have been removed as requested.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">If you expected an admin interface, please consult the API docs for endpoint management.</p>
          <div className="mt-4">
            <Button asChild><Link href="/docs">Go to API Docs</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

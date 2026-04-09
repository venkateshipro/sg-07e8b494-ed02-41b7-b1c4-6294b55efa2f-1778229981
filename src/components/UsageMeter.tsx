import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UsageMeterProps {
  title: string;
  used: number;
  limit: number;
  icon?: React.ReactNode;
}

export function UsageMeter({ title, used, limit, icon }: UsageMeterProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : (used / limit) * 100;
  const isNearLimit = percentage >= 80 && !isUnlimited;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{used}</span>
          <span className="text-sm text-muted-foreground">
            / {isUnlimited ? "Unlimited" : limit}
          </span>
        </div>
        {!isUnlimited && (
          <>
            <Progress 
              value={percentage} 
              className={isNearLimit ? "[&>div]:bg-destructive" : "[&>div]:bg-accent"}
            />
            {isNearLimit && (
              <p className="text-xs text-destructive">
                You're approaching your daily limit
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
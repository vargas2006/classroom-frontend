import { useGetIdentity } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Identity = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  avatar?: string;    // alias kept for backward compat
  fullName?: string;  // alias kept for backward compat
};

export function UserAvatar() {
  const { data: user, isLoading } = useGetIdentity<Identity>();

  if (isLoading || !user) {
    return <Skeleton className={cn("h-9", "w-9", "rounded-full")} />;
  }

  const displayName = user.name ?? user.fullName ?? user.email ?? "User";
  const avatarSrc  = user.image ?? user.avatar;

  return (
    <Avatar className={cn("h-9", "w-9")}>
      {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
      <AvatarFallback className="text-xs font-semibold">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

UserAvatar.displayName = "UserAvatar";

import {
  useRefineOptions,
  useActiveAuthProvider,
  useLogout,
} from "@refinedev/core";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { LogOutIcon, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Single Header (works on all screen sizes) ─────────────────────────────
export const Header = () => {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { title } = useRefineOptions();

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "flex shrink-0 items-center gap-2 sm:gap-3",
        "border-b border-border bg-sidebar",
        "h-14 sm:h-16",
        "px-2 sm:px-4",
        "transition-all duration-200"
      )}
    >
      {/* ── Sidebar toggle — ONE button, always visible ── */}
      <button
        onClick={toggleSidebar}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className={cn(
          "flex-shrink-0",
          "flex items-center justify-center",
          "h-8 w-8 rounded-md",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <PanelLeftOpen
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            (open && !isMobile) && "rotate-180"
          )}
        />
      </button>

      {/* ── App brand — shown in header only on mobile (sidebar hidden) or always on mobile ── */}
      {isMobile && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0">{title.icon}</div>
          <span className="text-sm font-bold truncate">{title.text}</span>
        </div>
      )}

      {/* ── Desktop spacer ── */}
      {!isMobile && <div className="flex-1" />}

      {/* ── Right side actions ── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  );
};

// ── User dropdown ─────────────────────────────────────────────────────────
const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const authProvider = useActiveAuthProvider();

  if (!authProvider?.getIdentity) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <UserAvatar />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer"
        >
          <LogOutIcon className="text-destructive" />
          <span className="text-destructive">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Header.displayName = "Header";

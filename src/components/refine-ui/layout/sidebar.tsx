"use client";

import React from "react";
import {
  useMenu,
  useLink,
  useRefineOptions,
  type TreeMenuItem,
} from "@refinedev/core";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarHeader as ShadcnSidebarHeader,
  useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight, ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Main Sidebar ──────────────────────────────────────────────────────────
export function Sidebar() {
  const { open } = useShadcnSidebar();
  const { menuItems, selectedKey } = useMenu();

  return (
    <ShadcnSidebar collapsible="icon" className="border-none">
      {/* Logo/title row — no toggle button here */}
      <SidebarHeader />

      <ShadcnSidebarContent
        className={cn(
          "flex flex-col gap-1 pt-2 pb-2 border-r border-border",
          "transition-all duration-200",
          open ? "px-3" : "px-1"
        )}
      >
        {menuItems.map((item: TreeMenuItem) => (
          <SidebarItem
            key={item.key || item.name}
            item={item}
            selectedKey={selectedKey}
          />
        ))}
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

// ── Sidebar Header — logo + name only, NO toggle button ───────────────────
function SidebarHeader() {
  const { title } = useRefineOptions();
  const { open } = useShadcnSidebar();

  return (
    <ShadcnSidebarHeader
      className={cn(
        "h-16 border-b border-border",
        "flex flex-row items-center overflow-hidden",
        open ? "px-4 gap-2 justify-start" : "px-0 justify-center"
      )}
    >
      {/* Logo icon — always visible */}
      <div className="flex-shrink-0">{title.icon}</div>

      {/* App name — only when expanded */}
      <span
        className={cn(
          "text-sm font-bold whitespace-nowrap overflow-hidden",
          "transition-all duration-300",
          open
            ? "max-w-[160px] opacity-100"
            : "max-w-0 opacity-0 pointer-events-none"
        )}
      >
        {title.text}
      </span>
    </ShadcnSidebarHeader>
  );
}

// ── Menu Items ────────────────────────────────────────────────────────────
type MenuItemProps = {
  item: TreeMenuItem;
  selectedKey?: string;
};

function SidebarItem({ item, selectedKey }: MenuItemProps) {
  const { open } = useShadcnSidebar();

  if (item.meta?.group) {
    return <SidebarItemGroup item={item} selectedKey={selectedKey} />;
  }
  if (item.children && item.children.length > 0) {
    return open
      ? <SidebarItemCollapsible item={item} selectedKey={selectedKey} />
      : <SidebarItemDropdown item={item} selectedKey={selectedKey} />;
  }
  return <SidebarItemLink item={item} selectedKey={selectedKey} />;
}

function SidebarItemGroup({ item, selectedKey }: MenuItemProps) {
  const { open } = useShadcnSidebar();
  return (
    <div className="border-t border-sidebar-border pt-4">
      <span
        className={cn(
          "ml-3 block text-xs font-semibold uppercase text-muted-foreground",
          "transition-all duration-200",
          open ? "h-8 opacity-100" : "h-0 opacity-0 pointer-events-none"
        )}
      >
        {getDisplayName(item)}
      </span>
      <div className="flex flex-col">
        {item.children?.map((child: TreeMenuItem) => (
          <SidebarItem key={child.key || child.name} item={child} selectedKey={selectedKey} />
        ))}
      </div>
    </div>
  );
}

function SidebarItemCollapsible({ item, selectedKey }: MenuItemProps) {
  return (
    <Collapsible className="w-full group">
      <CollapsibleTrigger asChild>
        <SidebarButton
          item={item}
          rightIcon={
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
          }
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-6 flex flex-col gap-1">
        {item.children?.map((child: TreeMenuItem) => (
          <SidebarItem key={child.key || child.name} item={child} selectedKey={selectedKey} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItemDropdown({ item, selectedKey }: MenuItemProps) {
  const Link = useLink();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarButton item={item} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        {item.children?.map((child: TreeMenuItem) => {
          const isSelected = child.key === selectedKey;
          return (
            <DropdownMenuItem key={child.key || child.name} asChild>
              <Link
                to={child.route || ""}
                className={cn("flex w-full items-center gap-2", {
                  "bg-accent text-accent-foreground": isSelected,
                })}
              >
                <ItemIcon icon={child.meta?.icon ?? child.icon} isSelected={isSelected} />
                <span>{getDisplayName(child)}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarItemLink({ item, selectedKey }: MenuItemProps) {
  return <SidebarButton item={item} isSelected={item.key === selectedKey} asLink />;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getDisplayName(item: TreeMenuItem) {
  return item.meta?.label ?? item.label ?? item.name;
}

function ItemIcon({ icon, isSelected }: { icon: React.ReactNode; isSelected?: boolean }) {
  return (
    <div className={cn("w-4 flex-shrink-0", isSelected ? "text-sidebar-primary-foreground" : "text-muted-foreground")}>
      {icon ?? <ListIcon />}
    </div>
  );
}

type SidebarButtonProps = React.ComponentProps<typeof Button> & {
  item: TreeMenuItem;
  isSelected?: boolean;
  rightIcon?: React.ReactNode;
  asLink?: boolean;
  onClick?: () => void;
};

function SidebarButton({ item, isSelected = false, rightIcon, asLink = false, className, onClick, ...props }: SidebarButtonProps) {
  const Link = useLink();

  const content = (
    <>
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <span
        className={cn("tracking-tight", {
          "flex-1 text-left": rightIcon,
          "line-clamp-1 truncate": !rightIcon,
          "font-semibold text-sidebar-primary-foreground": isSelected,
          "font-normal text-foreground": !isSelected,
        })}
      >
        {getDisplayName(item)}
      </span>
      {rightIcon}
    </>
  );

  return (
    <Button
      asChild={!!(asLink && item.route)}
      variant="ghost"
      size="lg"
      className={cn(
        "flex w-full items-center justify-start gap-2 py-2 !px-3 text-sm",
        {
          "bg-sidebar-primary hover:!bg-sidebar-primary/90 text-sidebar-primary-foreground": isSelected,
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {asLink && item.route ? (
        <Link to={item.route} className="flex w-full items-center gap-2">
          {content}
        </Link>
      ) : content}
    </Button>
  );
}

Sidebar.displayName = "Sidebar";

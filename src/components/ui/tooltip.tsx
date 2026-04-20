import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

interface TooltipProps {
    children: React.ReactNode
    content: string | React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
    delayDuration?: number
}

export function Tooltip({
    children,
    content,
    side = "top",
    delayDuration = 200,
}: TooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        className={cn(
                            "z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground border border-border shadow-md",
                            "transition-all duration-150 ease-out",
                            "data-[state=delayed-open]:animate-scale-in data-[state=closed]:opacity-0 data-[state=closed]:scale-95"
                        )}
                        sideOffset={5}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="fill-popover" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}

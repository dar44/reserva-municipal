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
                            "animate-in fade-in-0 zoom-in-95",
                            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                            "data-[side=bottom]:slide-in-from-top-2",
                            "data-[side=left]:slide-in-from-right-2",
                            "data-[side=right]:slide-in-from-left-2",
                            "data-[side=top]:slide-in-from-bottom-2"
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

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[var(--color-muted)] disabled:text-white",
    {
        variants: {
            variant: {
                default: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
                destructive:
                    "bg-[var(--color-trading-loss)] text-neutral-50 hover:bg-red-500/90",
                outline:
                    "border border-[var(--color-border)] bg-white hover:bg-[var(--color-table-hover)] hover:text-[var(--color-primary-text)]",
                secondary:
                    "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/80",
                ghost: "hover:bg-[var(--color-table-hover)] hover:text-[var(--color-primary-text)]",
                link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

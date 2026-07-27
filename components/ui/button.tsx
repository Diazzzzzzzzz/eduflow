import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * `btn` and `btn-<variant>` are inert hooks — they carry no styles of their own
 * and leave the classic theme pixel-identical. The modern theme uses them in
 * globals.css to give buttons their pressable depth.
 */
const buttonVariants = cva(
  "btn inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "btn-default bg-primary text-primary-foreground shadow-sm hover:bg-accent",
        secondary:
          "btn-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "btn-outline border border-input bg-card shadow-sm hover:bg-secondary hover:text-secondary-foreground",
        ghost: "btn-ghost hover:bg-secondary hover:text-secondary-foreground",
        success:
          "btn-success bg-success text-success-foreground shadow-sm hover:bg-success/90",
        destructive:
          "btn-destructive bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        link: "btn-link text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };

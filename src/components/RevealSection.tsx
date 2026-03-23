import { cn } from "@/lib/utils";
import { createElement, useEffect, useRef, useState } from "react";

type RevealSectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article";
  direction?: "up" | "left" | "right";
};

export const RevealSection = ({
  as = "section",
  className,
  children,
  direction = "up",
  ...props
}: RevealSectionProps) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className: cn(
        "reveal-section",
        direction === "left" && "reveal-left",
        direction === "right" && "reveal-right",
        visible && "reveal-visible",
        className,
      ),
      ...props,
    },
    children,
  );
};

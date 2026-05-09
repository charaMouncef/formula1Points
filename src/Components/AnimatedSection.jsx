import useInView from "../hooks/useInView";

export default function AnimatedSection({ children, className = "" }) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className={`${isInView ? "animate-fade-in-up" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

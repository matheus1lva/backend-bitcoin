import { Link as ReactRouterLink } from "react-router-dom";
export function Link({ to, children }) {
  return (
    <ReactRouterLink
      to={to}
      className="font-semibold text-primary-button hover:text-primary-button-hover underline"
    >
      {children}
    </ReactRouterLink>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { forwardRef } from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps
} from "react-router-dom";
import MuiLink, { LinkProps as MuiLinkProps } from "@material-ui/core/Link";

// eslint-disable-next-line react/display-name
export const ForwardedRouterLink = forwardRef<
  HTMLAnchorElement,
  RouterLinkProps
>((props, ref) => <RouterLink {...props} innerRef={ref} />);

interface LinkProps extends MuiLinkProps {
  to: string;
}

export default function Link(props: LinkProps) {
  return <MuiLink {...props} component={RouterLink as any} />;
}

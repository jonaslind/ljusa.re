import React, { Dispatch, SetStateAction } from "react";
import { Style, Styles } from "../Style";

export interface StyleProps {
  style: Style;
  styles: Styles;
  setStyle: Dispatch<SetStateAction<Style>>;
}

export function StyleSelector({ style, styles, setStyle }: StyleProps): JSX.Element {

  const toggleStyle: (() => void) = function(): void {
    if (style.name == "light") {
      styles.activateStyle("dark");
      setStyle(styles.getStyle("dark"));
    } else {
      styles.activateStyle("light");
      setStyle(styles.getStyle("light"));
    }
  }

  return (
    <i id="lightOrDarkStyleToggle" onClick={toggleStyle}>☀️ 🌙</i>
  );
}

import { useState } from "react";
import { useDidMount } from "@better-typed/react-lifecycle-hooks";
import { BuilderInstance } from "@better-typed/hyper-fetch";

export const useAppManager = <B extends BuilderInstance>(builder: B) => {
  const [online, setIsOnline] = useState(builder.appManager.isOnline);
  const [focused, setIsFocused] = useState(builder.appManager.isFocused);

  const mountEvents = () => {
    const unmountIsOnline = builder.appManager.events.onOnline(() => setIsOnline(true));
    const unmountIsOffline = builder.appManager.events.onOffline(() => setIsOnline(false));
    const unmountIsFocus = builder.appManager.events.onFocus(() => setIsFocused(true));
    const unmountIsBlur = builder.appManager.events.onBlur(() => setIsFocused(false));

    return () => {
      unmountIsOnline();
      unmountIsOffline();
      unmountIsFocus();
      unmountIsBlur();
    };
  };

  const setOnline = (isOnline: boolean) => {
    builder.appManager.setOnline(isOnline);
  };

  const setFocused = (isFocused: boolean) => {
    builder.appManager.setFocused(isFocused);
  };

  useDidMount(mountEvents);

  return { isOnline: online, isFocused: focused, setOnline, setFocused };
};

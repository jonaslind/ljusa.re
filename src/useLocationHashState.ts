import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export type LocationHashOptions<T> = {
  defaultValue: T | (() => T);
  serializer: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
};

export type LocationHashState<T> = [
  T,
  Dispatch<SetStateAction<T>>
];

export default function useLocationHashState<T>(options: LocationHashOptions<T>): LocationHashState<T> {
  var startValue: T | (() => T);
  if (window.location.hash) {
    startValue = options.serializer.deserialize(window.location.hash.substring(1));
  } else {
    startValue = options.defaultValue;
  }
  const [state, setStateDelegate]: [T, Dispatch<SetStateAction<T>>] = useState(startValue);
  useEffect(() => {
    function handleHashChange() {
      setStateDelegate(options.serializer.deserialize(window.location.hash.substring(1)));
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  const setState: Dispatch<SetStateAction<T>> = function(value: T | ((prevState: T) => T)): void {
    var newValue: T;
    if (value instanceof Function) {
      throw new Error("Not implemented");
    } else {
      newValue = value;
    }
    const serialized: string = options.serializer.serialize(newValue);
    window.location.hash = serialized;
    setStateDelegate(newValue);
  }
  return [state, setState];
}

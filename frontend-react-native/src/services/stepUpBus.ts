export type StepUpPayload = {
  message: string;
};

type StepUpListener = (payload: StepUpPayload) => void;

const listeners = new Set<StepUpListener>();

export const onStepUpRequired = (listener: StepUpListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitStepUpRequired = (payload: StepUpPayload): void => {
  listeners.forEach(listener => {
    try {
      listener(payload);
    } catch {
      // Keep the bus resilient.
    }
  });
};

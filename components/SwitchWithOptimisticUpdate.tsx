'use client';

import { useOptimistic, useTransition } from 'react';
import { Switch as SwitchUI } from '~/components/ui/switch';

const SwitchWithOptimisticUpdate = ({
  initialValue,
  updateValue,
  readOnly,
}: {
  initialValue: boolean;
  updateValue: (value: boolean) => Promise<boolean>;
  readOnly?: boolean;
}) => {
  const [isTransitioning, startTransition] = useTransition();
  const [optimisticIsActive, setOptimisticIsActive] = useOptimistic(
    initialValue,
    (_, newValue: boolean) => newValue,
  );

  const updateIsActive = async (newValue: boolean) => {
    setOptimisticIsActive(newValue);
    await updateValue(newValue);
  };

  return (
    <SwitchUI
      disabled={readOnly ?? isTransitioning}
      checked={optimisticIsActive}
      onCheckedChange={(checked) =>
        startTransition(() => updateIsActive(checked))
      }
    />
  );
};

export default SwitchWithOptimisticUpdate;

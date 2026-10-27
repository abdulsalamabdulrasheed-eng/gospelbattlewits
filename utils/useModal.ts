import { useState } from 'react';

export interface ModalConfig {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDanger: boolean;
  showCancel: boolean;
  confirmText?: string;
}

export function useModal() {
  const [modal, setModal] = useState<ModalConfig>({
    show: false, title: '', message: '', onConfirm: () => {}, isDanger: false, showCancel: true
  });

  const showModal = (config: Partial<ModalConfig>) => {
    setModal({
      show: true,
      title: config.title || 'Notice',
      message: config.message || '',
      onConfirm: config.onConfirm || (() => {}),
      isDanger: config.isDanger || false,
      showCancel: config.showCancel !== false,
      confirmText: config.confirmText || 'Confirm'
    });
  };

  const hideModal = () => setModal({ ...modal, show: false });

  return { modal, showModal, hideModal };
}

export const notifySuccess = (message: string) => {
  const event = new CustomEvent('notify', {
    detail: {
      type: 'success',
      title: 'Success',
      message
    }
  });
  window.dispatchEvent(event);
};

export const notifyError = (message: string) => {
  const event = new CustomEvent('notify', {
    detail: {
      type: 'error',
      title: 'Error',
      message
    }
  });
  window.dispatchEvent(event);
};

export const notifyInfo = (message: string) => {
  const event = new CustomEvent('notify', {
    detail: {
      type: 'info',
      title: 'Information',
      message
    }
  });
  window.dispatchEvent(event);
};
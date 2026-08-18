import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/button';
import { ReactPhone } from '@/components/ui/forms/phone-input';
import OtpCodeInput from '@/components/auth/otp-code-input';
import client from '@/data/client';
import { useModalAction } from '@/components/modal-views/context';
import { formatRussianPhone, normalizeRussianPhone, phoneHref } from '@/utils/phone';

interface UpdatePhoneModalProps {
  currentPhone?: string;
  userId: string;
  onSuccess?: () => void;
}

export default function UpdatePhoneModal({
  currentPhone,
  userId,
  onSuccess,
}: UpdatePhoneModalProps) {
  const { closeModal } = useModalAction();
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [callTo, setCallTo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Мутация для отправки OTP
  const { mutate: sendOtp } = useMutation(client.users.sendOtpCode, {
    onSuccess: (data) => {
      if (data.success && data.id) {
        setOtpId(data.id);
        setCallTo(data.call_to || null);
        setIsSendingOtp(false);
        toast.success(<b>Позвоните на указанный номер для подтверждения</b>, {
          className: '-mt-10 xs:mt-0',
        });
      } else {
        setIsSendingOtp(false);
        toast.error(<b>Ошибка отправки кода</b>, {
          className: '-mt-10 xs:mt-0',
        });
      }
    },
    onError: (error: any) => {
      setIsSendingOtp(false);
      toast.error(<b>{error.response?.data?.message || 'Ошибка отправки кода'}</b>, {
        className: '-mt-10 xs:mt-0',
      });
    },
  });

  // Мутация для обновления телефона
  const { mutate: updateContact } = useMutation(client.users.updateContact, {
    onSuccess: () => {
      toast.success(<b>Телефон успешно обновлен</b>, {
        className: '-mt-10 xs:mt-0',
      });
      closeModal();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      setIsVerifyingOtp(false);
      if (callTo) return;
      setOtpError(error.response?.data?.message || 'Неверный код');
      toast.error(<b>{error.response?.data?.message || 'Неверный код'}</b>, {
        className: '-mt-10 xs:mt-0',
      });
    },
  });

  useEffect(() => {
    if (!otpId || !callTo || isVerifyingOtp) return;
    const timer = window.setInterval(() => {
      setIsVerifyingOtp(true);
      updateContact({ otp_id: otpId, code: '', phone_number: normalizeRussianPhone(phoneNumber), user_id: userId });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [otpId, callTo, isVerifyingOtp, phoneNumber, userId, updateContact]);

  // Обработчик отправки OTP
  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error(<b>Введите корректный номер телефона</b>, {
        className: '-mt-10 xs:mt-0',
      });
      return;
    }
    
    setIsSendingOtp(true);
    setOtpError('');
    sendOtp({ phone_number: normalizeRussianPhone(phoneNumber) });
  };

  // Обработчик проверки OTP кода
  const handleVerifyOtp = (code: string) => {
    if (!otpId) return;
    
    setIsVerifyingOtp(true);
    setOtpError('');
    updateContact({
      otp_id: otpId,
      code: code,
      phone_number: normalizeRussianPhone(phoneNumber),
      user_id: userId,
    });
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-dark dark:text-light">
        Обновление телефона
      </h2>

      {!otpId ? (
        <>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-light">
              Новый номер телефона
            </label>
            <ReactPhone
              country="ru"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              inputClass="!w-full !h-11 !bg-light dark:!bg-dark-300 !border-gray-300 dark:!border-gray-600"
              buttonClass="!bg-light dark:!bg-dark-300 !border-gray-300 dark:!border-gray-600"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || !phoneNumber}
              loading={isSendingOtp}
              className="flex-1"
            >
              {isSendingOtp ? 'Подготовка...' : 'ПОДТВЕРДИТЬ ЗВОНКОМ'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <p className="mb-2 text-center text-sm text-dark/70 dark:text-light/70">
              Позвоните с номера {phoneNumber} на
            </p>
            <a href={phoneHref(callTo)} className="block text-center text-2xl font-bold tracking-wide text-brand">
              {formatRussianPhone(callTo)}
            </a>
            <p className="mt-2 text-center text-xs text-dark/60 dark:text-light/60">Звонок будет сброшен автоматически. Проверяем подтверждение…</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOtpId(null);
                setCallTo(null);
                setOtpCode('');
                setOtpError('');
              }}
              disabled={isVerifyingOtp}
              className="flex-1"
            >
              Изменить номер
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={isSendingOtp || isVerifyingOtp}
              className="flex-1"
            >
              Получить новый номер
            </Button>
          </div>
        </>
      )}
    </div>
  );
}


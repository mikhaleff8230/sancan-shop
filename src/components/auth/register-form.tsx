import * as yup from 'yup';
import type { SubmitHandler } from 'react-hook-form';
import type { RegisterUserInput } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Form } from '@/components/ui/forms/form';
import Password from '@/components/ui/forms/password';
import { useModalAction } from '@/components/modal-views/context';
import Input from '@/components/ui/forms/input';
import client from '@/data/client';
import Button from '@/components/ui/button';
import { RegisterBgPattern } from '@/components/auth/register-bg-pattern';
import { useState, useEffect } from 'react';
import useAuth from './use-auth';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import YandexAuthButton from './yandex-auth-button';
import { useForm } from 'react-hook-form';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import { getAuthToken } from '@/data/client/token.utils';
import AuthTabs from './auth-tabs';
import { ReactPhone } from '@/components/ui/forms/phone-input';
import OtpCodeInput from './otp-code-input';
import { formatRussianPhone, normalizeRussianPhone, phoneHref } from '@/utils/phone';
import RegistrationConsents from './registration-consents';

const registerUserValidationSchema = yup.object().shape({
  name: yup.string().max(20).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

const phoneRegisterValidationSchema = yup.object().shape({
  phone_number: yup.string().required('Телефон обязателен'),
  name: yup.string().max(20).required('Имя обязательно'),
});

interface RegisterUserFormProps {
  /**
   * Режим регистрации:
   * - 'customer' - обычный пользователь
   * - 'seller' - продавец (с SMS проверкой)
   */
  mode?: 'customer' | 'seller';
  /**
   * Callback после успешной регистрации
   */
  onSuccess?: () => void;
}

export default function RegisterUserForm({ 
  mode = 'customer',
  onSuccess 
}: RegisterUserFormProps = {}) {
  const { t } = useTranslation('common');
  const { openModal, closeModal } = useModalAction();
  const { authorize } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  let [serverError, setServerError] = useState<RegisterUserInput | null>(null);
  const [yandexData, setYandexData] = useState<{
    email?: string;
    name?: string;
    real_name?: string;
  } | null>(null);

  // Состояние для переключателя вкладок
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  
  // Состояние для OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [callTo, setCallTo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consents, setConsents] = useState({ terms: false, privacy: false, emailMarketing: false, pushMarketing: false });
  const consentPayload = {
    accept_terms: consents.terms,
    accept_privacy: consents.privacy,
    marketing_email_consent: consents.emailMarketing,
    marketing_push_consent: consents.pushMarketing,
  };

  // Автозаполнение полей при получении данных из Яндекс
  useEffect(() => {
    if (yandexData) {
      setName(yandexData.name || yandexData.real_name || '');
      setEmail(yandexData.email || '');
    }
  }, [yandexData]);

  // Мутация для регистрации по email
  const { mutate } = useMutation(client.users.register, {
    onSuccess: (res) => {
      if (!res.token) {
        toast.error(<b>{t('text-profile-page-error-toast')}</b>, {
          className: '-mt-10 xs:mt-0',
        });
        return;
      }
      authorize(res.token);
      queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const savedToken = getAuthToken();
          if (savedToken) {
            closeModal();
          } else {
            setTimeout(() => {
              authorize(res.token);
              setTimeout(() => {
                if (getAuthToken()) {
                  closeModal();
                }
              }, 100);
            }, 100);
          }
        });
      });
      
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        router.push('/select-address');
      }
    },
    onError: (err: any) => {
      console.log(err.response.data, 'error');
      setServerError(err.response.data);
    },
  });

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
        toast.error(<b>{data.message || 'Ошибка отправки кода'}</b>, {
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

  // Мутация для регистрации через OTP
  const { mutate: registerWithOtp } = useMutation(client.users.otpLogin, {
    onSuccess: (res) => {
      if (!res.token) {
        setIsVerifyingOtp(false);
        return;
      }
      
      // Если режим seller, нужно дополнительно зарегистрировать как STORE_OWNER
      if (mode === 'seller') {
        // После успешного OTP логина, нужно обновить права пользователя
        // Это делается через отдельный запрос или автоматически на бэкенде
        // Пока просто авторизуем
      }
      
      authorize(res.token);
      queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const savedToken = getAuthToken();
          if (savedToken) {
            closeModal();
            if (onSuccess) onSuccess();
          } else {
            setTimeout(() => {
              authorize(res.token);
              setTimeout(() => {
                if (getAuthToken()) {
                  closeModal();
                  if (onSuccess) onSuccess();
                }
              }, 100);
            }, 100);
          }
        });
      });
      
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        router.push('/select-address');
      }
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
      registerWithOtp({
        otp_id: otpId,
        code: '',
        phone_number: normalizeRussianPhone(phoneNumber),
        name,
        email: email || `${normalizeRussianPhone(phoneNumber)}@phone.auth`,
        permission: mode === 'seller' ? 'store_owner' : undefined,
        ...consentPayload,
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [otpId, callTo, isVerifyingOtp, phoneNumber, name, email, registerWithOtp]);

  // Обработчик отправки формы по email
  const onSubmit: SubmitHandler<RegisterUserInput> = (data) => {
    if (!consents.terms || !consents.privacy) {
      toast.error(<b>Примите обязательные документы и согласие на обработку данных</b>);
      return;
    }
    mutate({ ...data, ...consentPayload });
  };

  // Обработчик отправки OTP
  const handleSendOtp = () => {
    if (!consents.terms || !consents.privacy) {
      toast.error(<b>Примите обязательные документы и согласие на обработку данных</b>);
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error(<b>Введите корректный номер телефона</b>, {
        className: '-mt-10 xs:mt-0',
      });
      return;
    }
    
    if (!name) {
      toast.error(<b>Введите имя</b>, {
        className: '-mt-10 xs:mt-0',
      });
      return;
    }
    
    setIsSendingOtp(true);
    setOtpError('');
    sendOtp({ phone_number: normalizeRussianPhone(phoneNumber), mode: 'register' });
  };

  // Обработчик проверки OTP кода
  const handleVerifyOtp = (code: string) => {
    if (!otpId) return;
    
    setIsVerifyingOtp(true);
    setOtpError('');
    registerWithOtp({
      otp_id: otpId,
      code: code,
      phone_number: normalizeRussianPhone(phoneNumber),
      name: name,
      email: email || `${normalizeRussianPhone(phoneNumber)}@phone.auth`,
      permission: mode === 'seller' ? 'store_owner' : undefined,
      ...consentPayload,
    });
  };

  // Сброс состояния при смене вкладки
  const handleTabChange = (tab: 'phone' | 'email') => {
    setActiveTab(tab);
    setOtpId(null);
    setCallTo(null);
    setOtpCode('');
    setOtpError('');
    setPhoneNumber('');
  };

  return (
    <div className="bg-light px-6 pt-10 pb-8 dark:bg-dark-300 sm:px-8 lg:p-12">
      <RegisterBgPattern className="absolute bottom-0 left-0 text-light dark:text-dark-300 dark:opacity-60" />
      <div className="relative z-10 flex items-center">
        <div className="w-full shrink-0 text-left md:w-[380px]">
          <div className="flex flex-col pb-5 text-center lg:pb-9 xl:pb-10 xl:pt-2">
            <h2 className="text-lg font-medium tracking-[-0.3px] text-dark dark:text-light lg:text-xl">
              {t('text-welcome-back')}
            </h2>
            <div className="mt-1.5 text-13px leading-6 tracking-[0.2px] dark:text-light-900 lg:mt-2.5 xl:mt-3">
              {t('text-create-an-account')}{' '}
              <button
                onClick={() => openModal('LOGIN_VIEW')}
                className="inline-flex font-semibold text-brand hover:text-dark-400 hover:dark:text-light-500"
              >
                {t('text-login')}
              </button>
            </div>
          </div>

          {/* Переключатель вкладок */}
          <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Форма регистрации по телефону */}
          {activeTab === 'phone' && (
            <div className="space-y-4 lg:space-y-5">
              {/* Кнопка авторизации через Яндекс для автозаполнения */}
              {/* <YandexAuthButton
                mode={mode === 'seller' ? 'seller' : 'register'}
                onUserDataReceived={(data) => {
                  setYandexData({
                    email: data.email,
                    name: data.name,
                    real_name: data.real_name,
                  });
                  setName(data.name || data.real_name || '');
                  setEmail(data.email || '');
                  toast.success(<b>Данные из Яндекс заполнены</b>, {
                    className: '-mt-10 xs:mt-0',
                  });
                }}
                className="!mb-4"
              /> */}

              {/* Разделитель */}
              <div className="relative my-5 flex items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="mx-4 flex-shrink text-sm text-gray-500 dark:text-gray-400">
                  или
                </span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {!otpId ? (
                <>
                  {/* Поле ввода имени */}
                  <Input
                    label="contact-us-name-field"
                    inputClassName="bg-light dark:bg-dark-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!name ? 'Имя обязательно' : undefined}
                  />

                  {/* Поле ввода телефона */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-light">
                      Телефон
                    </label>
                    <ReactPhone
                      country="ru"
                      value={phoneNumber}
                      onChange={(value) => setPhoneNumber(value)}
                      inputClass="!w-full !h-11 !bg-light dark:!bg-dark-300 !border-gray-300 dark:!border-gray-600"
                      buttonClass="!bg-light dark:!bg-dark-300 !border-gray-300 dark:!border-gray-600"
                    />
                  </div>

                  {/* Поле email (опционально) */}
                  <Input
                    label="contact-us-email-field (опционально)"
                    inputClassName="bg-light dark:bg-dark-300"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || !phoneNumber || !name}
                    loading={isSendingOtp}
                    className="!mt-5 w-full text-sm tracking-[0.2px] lg:!mt-7"
                  >
                    {isSendingOtp ? 'Подготовка...' : 'ПОДТВЕРДИТЬ ЗВОНКОМ'}
                  </Button>
                </>
              ) : (
                <>
                  <div>
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
          )}

          {/* Форма регистрации по email */}
          {activeTab === 'email' && (
          <Form<RegisterUserInput>
            onSubmit={onSubmit}
            validationSchema={registerUserValidationSchema}
            serverError={serverError}
            className="space-y-4 lg:space-y-5"
            defaultValues={{
              name: yandexData?.name || yandexData?.real_name || '',
              email: yandexData?.email || '',
            }}
            key={yandexData ? `${yandexData.email}-${yandexData.name}` : 'default'}
          >
            {({ register, formState: { errors }, setValue }) => {
              // Автозаполнение при получении данных из Яндекс
              if (yandexData) {
                setValue('name', yandexData.name || yandexData.real_name || '');
                setValue('email', yandexData.email || '');
              }

              return (
                <>
                  {/* Кнопка авторизации через Яндекс для автозаполнения */}
                  {/* <YandexAuthButton
                    mode={mode === 'seller' ? 'seller' : 'register'}
                    onUserDataReceived={(data) => {
                      setYandexData({
                        email: data.email,
                        name: data.name,
                        real_name: data.real_name,
                      });
                      toast.success(<b>Данные из Яндекс заполнены</b>, {
                        className: '-mt-10 xs:mt-0',
                      });
                    }}
                    className="!mb-4"
                  /> */}

                  {/* Разделитель */}
                  {/* <div className="relative my-5 flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="mx-4 flex-shrink text-sm text-gray-500 dark:text-gray-400">
                      или
                    </span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                  </div> */}

                  <Input
                    label="contact-us-name-field"
                    inputClassName="bg-light dark:bg-dark-300"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="contact-us-email-field"
                    inputClassName="bg-light dark:bg-dark-300"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  <Password
                    label="text-auth-password"
                    inputClassName="bg-light dark:bg-dark-300"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <RegistrationConsents {...consents} onChange={(field, value) => setConsents((current) => ({ ...current, [field]: value }))} />
                  <Button
                    type="submit"
                    className="!mt-5 w-full text-sm tracking-[0.2px] lg:!mt-7"
                  >
                    {t('text-register')}
                  </Button>
                </>
              );
            }}
          </Form>
          )}
          {activeTab === 'phone' && !otpId && (
            <RegistrationConsents {...consents} onChange={(field, value) => setConsents((current) => ({ ...current, [field]: value }))} />
          )}
        </div>
      </div>
    </div>
  );
}

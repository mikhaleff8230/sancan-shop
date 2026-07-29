import QuestionCard from '@/components/questions/question-card';
import Pagination from '@/components/ui/pagination';
import { useEffect, useState } from 'react';
import { useModalAction } from '@/components/modal-views/context';
import { useRouter } from 'next/router';
import { useMe } from '@/data/user';
import isEmpty from 'lodash/isEmpty';
import QuestionSearch from './question-search';
import { useQuestions } from '@/data/question';
import { useTranslation } from 'next-i18next';

type ProductQuestionsProps = {
  className?: any;
  productId: string;
  shopId: string;
};

const ProductQuestions: React.FC<ProductQuestionsProps> = ({
  productId,
  shopId,
}) => {
  const [page, setPage] = useState(1);
  const { openModal } = useModalAction();
  const { query } = useRouter();
  const { isAuthorized } = useMe();
  const { t } = useTranslation('common');
  const { questions, paginatorInfo } = useQuestions({
    product_id: productId,
    limit: 5,
    page,
    ...(!isEmpty(query?.text) && { question: query.text?.toString() }),
  });

  useEffect(() => {
    setPage(1);
  }, [query.text]);

  function onPagination(current: number) {
    setPage(current);
  }

  const openQuestionModal = () => {
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    openModal('QUESTION_FORM', { product_id: productId, shop_id: shopId });
  };

  return (
    <div className="block">
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-ozon-border pb-5 lg:flex-row lg:items-center">
        <h2 className="text-2xl font-bold tracking-tight text-ozon-text">
          Вопросы о товаре <sup className="text-sm font-semibold text-ozon-muted">{paginatorInfo?.total ?? 0}</sup>
        </h2>
        <div className="inline-flex flex-col-reverse items-start gap-2.5 sm:flex-row sm:items-center">
          <div className="min-w-full sm:min-w-[300px]">
            <QuestionSearch label="Search" />
          </div>
          <button
            className="grow-0 rounded-xl bg-ozon-blue px-5 py-3 text-13px font-bold leading-5 text-white transition-colors hover:bg-ozon-blue-dark"
            onClick={openQuestionModal}
          >
            {t('text-ask-question')}
          </button>
        </div>
      </div>
      {questions?.length !== 0 ? (
        <div className="">
          <div className="">
            {questions?.map((question) => (
              <QuestionCard
                key={`question-no-${question?.id}`}
                question={question}
              />
            ))}
            {/* Pagination */}
            {paginatorInfo && (
              <div className="flex flex-col items-center justify-between space-y-1 border-t border-ozon-border py-5 md:flex-row md:space-y-0 md:py-3 md:pb-5 lg:pb-3">
                <div className="text-13px text-ozon-muted md:mt-2">
                  {t('text-page')} {paginatorInfo.currentPage} {t('text-of')}{' '}
                  {Math.ceil(paginatorInfo.total / paginatorInfo.perPage)}
                </div>

                <div className="mb-2 flex items-center">
                  <Pagination
                    total={paginatorInfo.total}
                    current={paginatorInfo.currentPage}
                    pageSize={paginatorInfo.perPage}
                    onChange={onPagination}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#f5f7fb] px-5 py-16">
          <h3 className="text-lg font-semibold text-ozon-muted">
            {t('text-no-question-found')}
          </h3>
        </div>
      )}
    </div>
  );
};

export default ProductQuestions;

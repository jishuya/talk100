import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

/**
 * ConfirmModal - 위험한 작업에 대한 확인 모달
 *
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {function} onConfirm - 확인 버튼 클릭 핸들러
 * @param {string} title - 모달 제목
 * @param {string} message - 경고 메시지
 * @param {array} items - 삭제될 항목 목록 (선택사항)
 * @param {string} confirmText - 확인 버튼 텍스트 (기본: "확인")
 * @param {string} cancelText - 취소 버튼 텍스트 (기본: "취소")
 * @param {string} type - 모달 타입 ("danger" | "warning") - 기본: "danger"
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  items = [],
  confirmText = '확인',
  cancelText = '취소',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* 배경 오버레이 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        {/* 모달 컨테이너 */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* 경고 아이콘 */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                {/* 제목 */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center mb-2"
                >
                  {title}
                </Dialog.Title>

                {/* 메시지 */}
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-center whitespace-pre-line">
                    {message}
                  </p>
                </div>

                {/* 삭제될 항목 목록 */}
                {items.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      다음 데이터가 영구적으로 삭제됩니다:
                    </p>
                    <ul className="space-y-1">
                      {items.map((item, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 되돌릴 수 없음 경고 */}
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 text-center font-medium">
                    ⚠️ 이 작업은 되돌릴 수 없습니다!
                  </p>
                </div>

                {/* 버튼 영역 */}
                <div className="mt-6 flex gap-3">
                  {/* 취소 버튼 */}
                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>

                  {/* 확인 버튼 */}
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                      type === 'danger'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                    onClick={handleConfirm}
                  >
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;

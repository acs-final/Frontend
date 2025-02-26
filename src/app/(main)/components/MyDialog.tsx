import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>다이얼로그 열기</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded">
          <Dialog.Title asChild>
            <VisuallyHidden>
              다이얼로그 제목
            </VisuallyHidden>
          </Dialog.Title>
          <Dialog.Description>
            여기에 다이얼로그 내용을 작성하세요.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
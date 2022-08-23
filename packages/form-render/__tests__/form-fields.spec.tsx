import * as React from 'react';
import '@testing-library/jest-dom';
import { render, act, cleanup } from '@testing-library/react';
import Demo from './form-demo';

function sleep(ms): Promise<never> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

afterAll(cleanup);

describe('FormRender API', () => {
  //   it('📦  api test setFields and getFieldError success', async () => {
  //     const { getByTestId, unmount } = render(<Demo />);

  //     // 测试 setFields + getFieldError
  //     act(() => {
  //       getByTestId('setFields').click();
  //     });
  //     await act(() => sleep(500));
  //     act(() => {
  //       getByTestId('getFieldError').click();
  //     });
  //    await act(() => sleep(500));

  //     expect(getByTestId('result')).toHaveTextContent(
  //       JSON.stringify(['set input1.test error'])
  //     );

  //     act(() => {
  //       unmount();
  //     });
  //   });

  //   it('📦  api test validateFields success', async () => {
  //     const { getByTestId, unmount } = render(<Demo />);
  //     act(() => {
  //       getByTestId('setFields').click();
  //     });
  //     await act(() => sleep(500));
  //     act(() => {
  //       getByTestId('validateFields').click();
  //     });
  //     await act(() => sleep(500));

  //     expect(getByTestId('result')).toHaveTextContent(
  //       JSON.stringify({
  //         errors: [
  //           {
  //             name: 'input1.test',
  //             error: ['set input1.test error'],
  //           },
  //         ],
  //         values: {
  //           input1: {
  //             test: 'input1.test value',
  //           },
  //         },
  //       })
  //     );

  //     act(() => {
  //       unmount();
  //     });
  //   });

  it('📦  api test isFieldValidating success', async () => {
    const { getByTestId, unmount } = render(<Demo />);

    // 测试 isFieldValidating
    act(() => {
      getByTestId('setFields').click();
    });
    await act(() => sleep(500));
    act(() => {
      getByTestId('fieldValidating').click();
    });
    await act(() => sleep(500));

    expect(getByTestId('result')).toHaveTextContent('true');

    act(() => {
      unmount();
    });
  });

  //   it('📦  api test fieldTouched success', async () => {
  //     const { getByTestId, unmount } = render(<Demo />);
  //     act(() => {
  //       getByTestId('setFields').click();
  //     });
  //     await act(() => sleep(500));
  //     // 测试isFieldTouched
  //     act(() => {
  //       getByTestId('fieldTouched').click();
  //     });
  //     await act(() => sleep(500));
  //     expect(getByTestId('result')).toHaveTextContent('true');
  //     act(() => {
  //       unmount();
  //     });
  //   });

  //   it('📦  api test isFieldsTouched success', async () => {
  //     const { getByTestId, unmount } = render(<Demo />);
  //     act(() => {
  //       getByTestId('setFields').click();
  //     });
  //     await act(() => sleep(500));
  //     // 测试isFieldsTouched
  //     act(() => {
  //       getByTestId('fieldsTouched').click();
  //     });
  //     await act(() => sleep(500));
  //     expect(getByTestId('result')).toHaveTextContent('false');
  //     act(() => {
  //       unmount();
  //     });
  //   });
});

// // 测试isFieldTouched
// act(() => {
//   getByTestId('fieldTouched').click();
// });
// await act(() => sleep(500));
// expect(getByTestId('result')).toHaveTextContent('true');

// // 测试isFieldsTouched
// act(() => {
//   getByTestId('fieldsTouched').click();
// });
// await act(() => sleep(500));
// expect(getByTestId('result')).toHaveTextContent('false');

// // 测试 isFieldValidating
// act(() => {
//   getByTestId('fieldValidating').click();
// });
// await act(() => sleep(500));
// expect(getByTestId('result')).toHaveTextContent('true');

// // 测试 getValues
// act(() => {
//   getByTestId('getValues').click();
// });
// await act(() => sleep(500));
// expect(getByTestId('result')).toHaveTextContent(
//   JSON.stringify({
//     input1: {
//       test: 'input1.test value',
//     },
//   })
// );

// // 测试 validateFields
// act(() => {
//   getByTestId('validateFields').click();
// });
// await act(() => sleep(500));
// expect(getByTestId('result')).toHaveTextContent(
//   JSON.stringify({
//     errors: [
//       {
//         error: ['set input1.test error'],
//         name: 'input1.test',
//       },
//     ],
//     values: {
//       input1: {
//         test: 'input1.test value',
//       },
//     },
//   })
// );

// act(() => {
//   unmount();
// });

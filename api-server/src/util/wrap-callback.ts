

type CallbackDone<T> = { (err: any, user: T | undefined): void };
type AsyncPromiseFn<T> = { (...args: any[]): Promise<T> };

export function wrapCallback<T>(promiseFn: AsyncPromiseFn<T>) {
    return function(...allArgs: any[]) {
        let done = allArgs[allArgs.length - 1];
        let args = allArgs.splice(0, allArgs.length - 1);
        promiseFn(...args)
            .then(
                result => done(undefined, result),
                err => done(err, undefined)
            );
    }
}

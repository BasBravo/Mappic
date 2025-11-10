export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function loadScripts(scripts: string[], callback?: any) {
    const promises: any[] = [];
    scripts.forEach((script: string) => {
        promises.push(
            new Promise((resolve, reject) => {
                const el = document.createElement('script');
                el.src = script;
                el.onload = resolve;
                el.onerror = reject;
                document.body.appendChild(el);
            }),
        );
    });
    return Promise.all(promises).then(callback);
}
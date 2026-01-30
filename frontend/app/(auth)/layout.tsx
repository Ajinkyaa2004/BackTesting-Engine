export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
            <div className="w-full max-w-md space-y-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--color-primary)]">Backtesting Platform</h1>
                    <p className="text-[var(--color-muted)]">Professional Strategy Engine</p>
                </div>
                {children}
            </div>
        </div>
    );
}

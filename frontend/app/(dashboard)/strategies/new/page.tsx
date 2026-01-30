"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StrategyTemplates from "@/components/ui/strategy-templates";
import Editor from "@monaco-editor/react";
import { ArrowLeft, Save, Code2, Sparkles, FileText, Lightbulb } from "lucide-react";
import Link from "next/link";

const DEFAULT_TEMPLATE = `from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict

class MyStrategy(BaseStrategy):
    """
    Example strategy template.
    """
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Initialize indicators or state here
    
    def initialize(self):
        """Initialize strategy - called once before processing candles."""
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """
        Called for every new candle.
        Return an order dictionary or None.
        """
        if not self.initialized:
            self.initialize()
            
        # Example: Simple random entry
        # return {
        #     "action": "BUY",
        #     "quantity": 1.0,
        #     "order_type": "MARKET",
        #     "stop_loss_pct": 0.02,
        #     "take_profit_pct": 0.04
        # }
        return None
`;

export default function NewStrategyPage() {
    const router = useRouter();
    const [step, setStep] = useState<"template" | "code">("template");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [className, setClassName] = useState("MyStrategy");
    const [code, setCode] = useState(DEFAULT_TEMPLATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const handleTemplateSelect = (template: any) => {
        setSelectedTemplate(template);
        setName(template.name);
        setDescription(template.description);
        setClassName(template.className);
        setCode(template.code);
        setStep("code");
    };

    const handleSave = async () => {
        if (!name || !className || !code) {
            setError("Please fill in all required fields.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await api.post("/strategies/upload", {
                name,
                description,
                class_name: className,
                code
            });
            router.push("/strategies");
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail || "Failed to save strategy.");
            } else {
                setError("Connection error.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToTemplates = () => {
        setStep("template");
        setSelectedTemplate(null);
    };

    if (step === "template") {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/strategies">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-primary-text)] mb-2">
                                Create New Strategy
                            </h1>
                            <p className="text-[var(--color-muted)] text-lg">
                                Choose a template to get started or build from scratch
                            </p>
                        </div>
                    </div>
                </div>

                {/* Templates */}
                <StrategyTemplates onSelectTemplate={handleTemplateSelect} />
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            {/* Header Actions */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleBackToTemplates}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-[var(--color-primary-text)]">
                                {selectedTemplate ? selectedTemplate.name : "New Strategy"}
                            </h2>
                            {selectedTemplate && selectedTemplate.id !== "custom" && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                                    Template
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--color-muted)]">
                            {selectedTemplate ? "Customize your strategy code and parameters" : "Define your trading logic in Python"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleBackToTemplates}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Change Template
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="btn-gradient">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Strategy"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-[var(--color-trading-loss)] p-4 rounded-lg text-sm shrink-0 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                        </div>
                        {error}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* Metadata Form */}
                <Card className="h-fit card-hover">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                            Strategy Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Strategy Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Moving Average Crossover"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="focus-ring"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="className">Class Name (Python) *</Label>
                            <div className="relative">
                                <Code2 className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-muted)]" />
                                <Input
                                    id="className"
                                    className="pl-9 font-mono text-sm focus-ring"
                                    placeholder="MyStrategy"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                                <Lightbulb className="h-3 w-3" />
                                Must match the class name in your code
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[100px] w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Describe how this strategy works..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Template Info */}
                        {selectedTemplate && selectedTemplate.id !== "custom" && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Template Features:</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    {selectedTemplate.features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Code Editor */}
                <div className="lg:col-span-3 h-full min-h-[500px] border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col bg-white shadow-sm card-hover">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-[var(--color-secondary-text)]">
                                strategy.py
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-[var(--color-muted)]">Python 3.10+</span>
                            <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Syntax OK
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                lineNumbers: "on",
                                roundedSelection: false,
                                scrollbar: {
                                    vertical: "visible",
                                    horizontal: "visible"
                                },
                                theme: "vs",
                                wordWrap: "on",
                                folding: true,
                                showFoldingControls: "always",
                                bracketPairColorization: {
                                    enabled: true
                                }
                            }}
                            theme="vs"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

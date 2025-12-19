import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Edit2, Plus } from 'lucide-react';

export interface ColorState {
    mode: 'solid' | 'gradient';
    solid: string; // Hex
    gradient: {
        start: string;
        end: string;
        style: 'linear' | 'radial' | 'diagonal-tr' | 'diagonal-tl';
    };
}

interface ColorPickerProps {
    value: ColorState;
    onChange: (value: ColorState) => void;
}

const GRADIENT_PRESETS = [
    { start: '#FFFFFF', end: '#F3F4F6' }, // White -> Gray
    { start: '#F3F4F6', end: '#9CA3AF' }, // Gray -> Dark Gray
    { start: '#9CA3AF', end: '#374151' }, // Dark Gray -> Charcoal
    { start: '#FEF3C7', end: '#F59E0B' }, // Amber
    { start: '#DBEAFE', end: '#3B82F6' }, // Blue
    { start: '#FCE7F3', end: '#EC4899' }, // Pink
];

const GRADIENT_STYLES = [
    { id: 'linear', label: 'Linear', css: 'bg-gradient-to-r' },
    { id: 'diagonal-tl', label: 'Diagonal TL', css: 'bg-gradient-to-br' },
    { id: 'diagonal-tr', label: 'Diagonal TR', css: 'bg-gradient-to-bl' },
    { id: 'radial', label: 'Radial', css: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]' },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>(value.mode);

    useEffect(() => {
        if (activeTab !== value.mode) {
            onChange({ ...value, mode: activeTab });
        }
    }, [activeTab]);

    const handleSolidChange = (hex: string) => {
        onChange({ ...value, solid: hex });
    };

    const handleGradientChange = (updates: Partial<ColorState['gradient']>) => {
        onChange({
            ...value,
            gradient: { ...value.gradient, ...updates }
        });
    };

    return (
        <div className="w-full max-w-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => setActiveTab('solid')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'solid'
                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Solid color
                </button>
                <button
                    onClick={() => setActiveTab('gradient')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'gradient'
                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Gradient
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'solid' ? (
                    <div className="space-y-4">
                        {/* Color preview/selector area - simplified as a large input for now */}
                        <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden shadow-inner ring-1 ring-gray-200 dark:ring-gray-700">
                            <input
                                type="color"
                                value={value.solid}
                                onChange={(e) => handleSolidChange(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 border-0"
                            />
                            <div
                                className="w-full h-full"
                                style={{ backgroundColor: value.solid }}
                            />
                            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 pointer-events-none" />
                        </div>

                        {/* Hue Slider (mock - input type color handles this on OS level, but we can show a bar) */}
                        <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80 pointer-events-none" />

                        {/* Hex Input */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                                    style={{ backgroundColor: value.solid }}
                                />
                                <input
                                    type="text"
                                    value={value.solid.toUpperCase()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.startsWith('#')) handleSolidChange(val);
                                        else handleSolidChange('#' + val);
                                    }}
                                    className="w-full pl-10 pr-10 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 uppercase"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Gradient Presets */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Gradient colors</label>
                            <div className="flex flex-wrap gap-3">
                                {GRADIENT_PRESETS.map((preset, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleGradientChange({ start: preset.start, end: preset.end })}
                                        className={`w-10 h-10 rounded-full border-2 transition-transform shadow-sm ${value.gradient.start === preset.start && value.gradient.end === preset.end
                                                ? 'border-purple-600 scale-110'
                                                : 'border-transparent hover:scale-105'
                                            }`}
                                        style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }}
                                    />
                                ))}

                                {/* Custom Gradient Trigger - Simplified */}
                                <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:border-purple-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Style Selector */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Style</label>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {GRADIENT_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => handleGradientChange({ style: style.id as any })}
                                        className={`w-14 h-14 rounded-lg border-2 transition-all flex-shrink-0 ${value.gradient.style === style.id
                                                ? 'border-purple-600 ring-2 ring-purple-600/20'
                                                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div
                                            className={`w-full h-full rounded-md ${style.css}`}
                                            style={{
                                                // We use internal style/classes for layout, but inject actual colors via inline style
                                                // Note: Tailwind gradient utilities need 'from' and 'to' colors, but we can't easily dynamic them with full arbitrary values in all cases optimally without inline styles for the variables or background-image
                                                backgroundImage: style.id === 'radial'
                                                    ? `radial-gradient(circle at center, ${value.gradient.start}, ${value.gradient.end})`
                                                    : style.id === 'linear'
                                                        ? `linear-gradient(to right, ${value.gradient.start}, ${value.gradient.end})`
                                                        : style.id === 'diagonal-tl'
                                                            ? `linear-gradient(to bottom right, ${value.gradient.start}, ${value.gradient.end})`
                                                            : `linear-gradient(to bottom left, ${value.gradient.start}, ${value.gradient.end})`
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

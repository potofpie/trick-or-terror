// PICO-8 Fantasy Console Constraints
export const PICO8 = {
    // Screen dimensions (logical 128x128, displayed at 4x scale)
    SCREEN_WIDTH: 128,
    SCREEN_HEIGHT: 128,
    DISPLAY_SCALE: 4,
    DISPLAY_WIDTH: 128 * 4,
    DISPLAY_HEIGHT: 128 * 4,
    
    // Color palette (16 colors)
    COLORS: {
        BLACK: 0,
        DARK_BLUE: 1,
        DARK_PURPLE: 2,
        DARK_GREEN: 3,
        BROWN: 4,
        DARK_GRAY: 5,
        LIGHT_GRAY: 6,
        WHITE: 7,
        RED: 8,
        ORANGE: 9,
        YELLOW: 10,
        GREEN: 11,
        BLUE: 12,
        INDIGO: 13,
        PINK: 14,
        PEACH: 15
    },
    
    // Sprite constraints
    SPRITE_SIZE: 8,
    MAX_SPRITES: 256,
    SPRITE_SHEET_SIZE: 128,
    
    // Map constraints
    MAP_WIDTH: 128,
    MAP_HEIGHT: 32,
    TILE_SIZE: 8,
    
    // Code constraints
    MAX_TOKENS: 8192,
    MAX_CHARS: 65536,
    CARTRIDGE_SIZE: 32768,
    
    // Audio constraints
    MAX_CHANNELS: 4,
    MAX_WAVEFORMS: 8
};

// PICO-8 color palette as hex values
export const PICO8_PALETTE = [
    '#000000', // BLACK
    '#1D2B53', // DARK_BLUE
    '#7E2553', // DARK_PURPLE
    '#008751', // DARK_GREEN
    '#AB5236', // BROWN
    '#5F574F', // DARK_GRAY
    '#C2C3C7', // LIGHT_GRAY
    '#FFF1E8', // WHITE
    '#FF004D', // RED
    '#FFA300', // ORANGE
    '#FFEC27', // YELLOW
    '#00E436', // GREEN
    '#29ADFF', // BLUE
    '#83769C', // INDIGO
    '#FF77A8', // PINK
    '#FFCCAA'  // PEACH
];

// Utility functions for PICO-8 constraints
export class PICO8Utils {
    static getColor(index: number): string {
        return PICO8_PALETTE[index % 16];
    }
    
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
    
    static wrap(value: number, max: number): number {
        return ((value % max) + max) % max;
    }
    
    // Convert world coordinates to screen coordinates
    static worldToScreen(x: number, y: number): { x: number, y: number } {
        return {
            x: this.clamp(x, 0, PICO8.SCREEN_WIDTH - 1),
            y: this.clamp(y, 0, PICO8.SCREEN_HEIGHT - 1)
        };
    }
    
    // Check if coordinates are within screen bounds
    static isOnScreen(x: number, y: number): boolean {
        return x >= 0 && x < PICO8.SCREEN_WIDTH && y >= 0 && y < PICO8.SCREEN_HEIGHT;
    }
}

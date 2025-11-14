import { type GPUData } from '../../view/ViewContainer';

import type { Container } from '../Container';

/**
 * The GPUDataMixin interface provides methods for storing and managing GPU data associated with a container.
 * @category scene
 * @advanced
 */
export interface GPUDataMixin
{
    /** @internal */
    _gpuData: Record<number, unknown>;
    /**
     * Unloads GPU resources associated with this view.
     * This should be called when the view is no longer needed to free up GPU memory.
     *
     * This method is automatically called when the container is destroyed.
     * @param {boolean} [children=false] - Whether to also unload GPU resources for all child containers. Default is false.
     * @example
     * ```ts
     * // Unload GPU resources when done with the sprite
     * sprite.unload();
     * // unload a containers contents
     * container.unload(true);
     * ```
     */
    unload(children?: boolean): void;
}

/** @internal */
export const gpuDataMixin: Partial<Container> = {
    unload(children = false): void
    {
        for (const key in this._gpuData)
        {
            (this._gpuData[key] as GPUData).destroy?.();
        }

        this._gpuData = Object.create(null);

        if (children)
        {
            for (let i = 0; i < this.children.length; i++)
            {
                const child = this.children[i];

                child.unload?.(true);
            }
        }
    }
} as Container;

import { Container } from '../Container';

describe('gpuDataMixin', () =>
{
    describe('unload', () =>
    {
        it('should initialize _gpuData as empty object', () =>
        {
            const container = new Container();

            expect(container._gpuData).toBeDefined();
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should unload GPU data and reset _gpuData', () =>
        {
            const container = new Container();
            const mockGPUData = {
                destroy: jest.fn(),
            };

            container._gpuData[1] = mockGPUData;
            container._gpuData[2] = mockGPUData;

            container.unload();

            expect(mockGPUData.destroy).toHaveBeenCalledTimes(2);
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should handle GPU data without destroy method', () =>
        {
            const container = new Container();
            const mockGPUData = { someProperty: 'value' };

            container._gpuData[1] = mockGPUData;

            expect(() => container.unload()).not.toThrow();
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should not unload children by default', () =>
        {
            const parent = new Container();
            const child = new Container();
            const grandchild = new Container();

            const childMockGPUData = { destroy: jest.fn() };
            const grandchildMockGPUData = { destroy: jest.fn() };

            child._gpuData[1] = childMockGPUData;
            grandchild._gpuData[1] = grandchildMockGPUData;

            parent.addChild(child);
            child.addChild(grandchild);

            parent.unload();

            expect(childMockGPUData.destroy).not.toHaveBeenCalled();
            expect(grandchildMockGPUData.destroy).not.toHaveBeenCalled();
        });

        it('should unload children when children parameter is true', () =>
        {
            const parent = new Container();
            const child = new Container();
            const grandchild = new Container();

            const parentMockGPUData = { destroy: jest.fn() };
            const childMockGPUData = { destroy: jest.fn() };
            const grandchildMockGPUData = { destroy: jest.fn() };

            parent._gpuData[1] = parentMockGPUData;
            child._gpuData[1] = childMockGPUData;
            grandchild._gpuData[1] = grandchildMockGPUData;

            parent.addChild(child);
            child.addChild(grandchild);

            parent.unload(true);

            expect(parentMockGPUData.destroy).toHaveBeenCalledTimes(1);
            expect(childMockGPUData.destroy).toHaveBeenCalledTimes(1);
            expect(grandchildMockGPUData.destroy).toHaveBeenCalledTimes(1);

            expect(Object.keys(parent._gpuData).length).toBe(0);
            expect(Object.keys(child._gpuData).length).toBe(0);
            expect(Object.keys(grandchild._gpuData).length).toBe(0);
        });

        it('should handle children without unload method', () =>
        {
            const parent = new Container();
            const child = new Container();

            // Remove unload method to simulate a child without it
            delete (child as any).unload;

            parent.addChild(child);

            expect(() => parent.unload(true)).not.toThrow();
        });

        it('should handle multiple GPU data entries', () =>
        {
            const container = new Container();
            const destroyMocks = [
                jest.fn(),
                jest.fn(),
                jest.fn(),
            ];

            container._gpuData[1] = { destroy: destroyMocks[0] };
            container._gpuData[2] = { destroy: destroyMocks[1] };
            container._gpuData[3] = { destroy: destroyMocks[2] };

            container.unload();

            destroyMocks.forEach((mock) =>
            {
                expect(mock).toHaveBeenCalledTimes(1);
            });
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should create new empty object after unload', () =>
        {
            const container = new Container();
            const mockGPUData = { destroy: jest.fn() };

            container._gpuData[1] = mockGPUData;
            const oldGPUData = container._gpuData;

            container.unload();

            expect(container._gpuData).not.toBe(oldGPUData);
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should handle calling unload multiple times', () =>
        {
            const container = new Container();
            const mockGPUData = { destroy: jest.fn() };

            container._gpuData[1] = mockGPUData;

            container.unload();
            container.unload();

            expect(mockGPUData.destroy).toHaveBeenCalledTimes(1);
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should handle empty _gpuData', () =>
        {
            const container = new Container();

            expect(() => container.unload()).not.toThrow();
            expect(Object.keys(container._gpuData).length).toBe(0);
        });

        it('should unload only direct children when children=true', () =>
        {
            const parent = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const grandchild = new Container();

            const child1MockGPUData = { destroy: jest.fn() };
            const child2MockGPUData = { destroy: jest.fn() };
            const grandchildMockGPUData = { destroy: jest.fn() };

            child1._gpuData[1] = child1MockGPUData;
            child2._gpuData[1] = child2MockGPUData;
            grandchild._gpuData[1] = grandchildMockGPUData;

            parent.addChild(child1);
            parent.addChild(child2);
            child1.addChild(grandchild);

            parent.unload(true);

            // Direct children should be unloaded
            expect(child1MockGPUData.destroy).toHaveBeenCalledTimes(1);
            expect(child2MockGPUData.destroy).toHaveBeenCalledTimes(1);

            // Grandchildren should also be unloaded because child1.unload(true) is called recursively
            expect(grandchildMockGPUData.destroy).toHaveBeenCalledTimes(1);
        });

        it('should handle mixed children with and without GPU data', () =>
        {
            const parent = new Container();
            const childWithGPU = new Container();
            const childWithoutGPU = new Container();
            const mockGPUData = { destroy: jest.fn() };

            childWithGPU._gpuData[1] = mockGPUData;

            parent.addChild(childWithGPU);
            parent.addChild(childWithoutGPU);

            parent.unload(true);

            expect(mockGPUData.destroy).toHaveBeenCalledTimes(1);
            expect(Object.keys(childWithGPU._gpuData).length).toBe(0);
            expect(Object.keys(childWithoutGPU._gpuData).length).toBe(0);
        });

        it('should handle GPU data with numeric string keys', () =>
        {
            const container = new Container();
            const mockGPUData1 = { destroy: jest.fn() };
            const mockGPUData2 = { destroy: jest.fn() };

            // Using numeric string keys
            container._gpuData['1'] = mockGPUData1;
            container._gpuData['2'] = mockGPUData2;

            container.unload();

            expect(mockGPUData1.destroy).toHaveBeenCalledTimes(1);
            expect(mockGPUData2.destroy).toHaveBeenCalledTimes(1);
            expect(Object.keys(container._gpuData).length).toBe(0);
        });
    });
});

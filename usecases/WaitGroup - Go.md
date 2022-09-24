> #go 

- `WaitGroup` 等待一组 `goroutines` 运行结束 
	> A `WaitGroup` waits for a collection of goroutines to finish.
- `Add` 方法的调用，设置了需要等待的 `goroutine` 的数量 ==1-REF==
	> The main goroutine calls Add to set the number of goroutines to wait for.
- 每一个 `goroutine` 运行到最后执行 `Done` 方法，表示结束 ==2-REF==
	> Then each of the goroutines runs and calls Done when finished. 
- `Wait` 方法会阻塞，直到所有 `goroutine` 运行结束  ==3-REF==
	> At the same time, Wait can be used to block until all goroutines have finished.


```go
t.Run("it runs safely concurrently", func(t *testing.T) {
	wantedCount := 1000
	counter := Counter{}

	var wg sync.WaitGroup 
	wg.Add(wantedCount) // ==1-REF==

	for i := 0; i < wantedCount; i++ {
		go func() {
			counter.Inc()
			wg.Done() // ==2-REF==
		}()
	}
	wg.Wait() // ==3-REF==

	assertCounter(t, counter, wantedCount)
})
```

## How it work?
---

1. The producer seeds a job in beanstalkd with tube_name = selinaljx

#####Sample beanstalkd payload:
```
{
  "from": "HKD",
  "to": "USD"
}
```

2. The worker gets the job from beanstalkd, gets the data from api.fixer.io and saves it to mongodb. Exchange rate is rounded off to `2` decmicals in `STRING` type.
	
	a. If request is failed, reput to the tube and delay with 3s.

	b. If request is succeed, reput to the tube and delay with 60s.

#####Sample mongodb data:
```
{
	"from": "HKD",
	"to": "USD",
	"created_at": new Date(),
	"rate": "0.13"
}

```

3. The task is stopped if 10 succeed attempts or 3 failed attempts in total.

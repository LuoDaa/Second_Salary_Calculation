# Mascot Animation Assets

This directory is reserved for the production mascot animation file.

Expected final file:

```text
assets/mascot/calf-worker.riv
```

The app code should load this Rive file first. If it is missing, the app falls back to:

```text
assets/calf-person.png
```

Required Rive state machine name:

```text
PetState
```

Required inputs:

```text
action_idle
action_typing
action_drink
action_slack
action_eat
action_happy
action_reminder
```


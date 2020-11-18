#!/bin/bash

for module in core calibration frontend_core perception_core tractor
do
  cd $FARM_NG_ROOT/build/modules/$module/protos/ts && yarn
done

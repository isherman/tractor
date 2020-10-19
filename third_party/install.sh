#!/bin/bash

. ../setup.bash

./install-opencv.sh

cd $FARM_NG_ROOT/third_party
mkdir -p build-ceres
cd build-ceres
cmake -DCMAKE_INSTALL_PREFIX=$FARM_NG_ROOT/env -DCMAKE_PREFIX_PATH=$FARM_NG_ROOT/env/ -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=OFF -DBUILD_EXAMPLES=OFF ../ceres-solver
make -j$(nproc --ignore=1)
make install

cd $FARM_NG_ROOT/third_party
mkdir -p build-sophus
cd build-sophus
cmake -DCMAKE_INSTALL_PREFIX=$FARM_NG_ROOT/env -DCMAKE_PREFIX_PATH=$FARM_NG_ROOT/env/ -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTS=OFF -DBUILD_EXAMPLES=OFF ../Sophus
make -j$(nproc --ignore=1)
make install

cd $FARM_NG_ROOT/third_party
mkdir -p build-apriltag
cd build-apriltag
cmake -DCMAKE_INSTALL_PREFIX=$FARM_NG_ROOT/env -DCMAKE_PREFIX_PATH=$FARM_NG_ROOT/env/ -DCMAKE_BUILD_TYPE=Release ../apriltag
make -j$(nproc --ignore=1)
make install

cd $FARM_NG_ROOT/third_party
mkdir -p build-iwyu
cd build-iwyu
CLANG_VERSION=10
# Absolute paths to LLVM's root and bin directory
PREFIX_PATH=`llvm-config-$CLANG_VERSION --prefix`
BIN_PATH=`llvm-config-$CLANG_VERSION --bindir`
BIN_PATH=`llvm-config-10 --bindir`
cmake -DCMAKE_INSTALL_PREFIX=$FARM_NG_ROOT/env -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=$PREFIX_PATH -DCMAKE_C_COMPILER=$BIN_PATH/clang -DCMAKE_CXX_COMPILER=$BIN_PATH/clang++ ../iwyu
make -j$(nproc --ignore=1)
make install

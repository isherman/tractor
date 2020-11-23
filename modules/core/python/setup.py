import os

import setuptools

with open('README.md') as fh:
    long_description = fh.read()

module = os.path.basename(os.path.abspath('..'))

setuptools.setup(
    name=f'farm-ng-{module}-ianjsherman',
    version='0.0.3',
    author='farm-ng',
    author_email='dev@farm-ng.com',
    description=f'The farm-ng {module} module',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/farm-ng/tractor',
    license='Apache',
    data_files=[('', ['LICENSE'])],
    install_requires=[
        'protobuf',
        f'farm-ng-{module}-protos-ianjsherman',
    ],
    packages=setuptools.find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)

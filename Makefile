
.PHONY: docker-build docker-shell print-build-args \
        default build \
        print-docker-hub-image kill \
				clean

SHELL=bash

default:
	echo pass

######
# docker stuff

IMAGE_NAME=phlummox-blog

IMAGE_VERSION=0.1.0

print-image-name:
	@echo $(IMAGE_NAME)

print-image-version:
	@echo $(IMAGE_VERSION)

###
# eleventy stuff

IMG=$(IMAGE_NAME):$(IMAGE_VERSION)
PACKAGE_DIR=/opt/site
ELEVENTY_JS_FILE=/src/.eleventy.js
IN_DIR = $$PWD/src
ASSETS_DIR = $$PWD/assets
OUT_DIR = $$PWD/out
# uncomment this to debug eleventy:
#DEBUG_FLAGS=DEBUG='*'
# change this to 'development' to use that environment
# for the build
ENVIRO_FLAGS=ELEVENTY_ENV=production
#ENVIRO_FLAGS=ELEVENTY_ENV=development
CTR_NAME=eleventy

#MOUNT_PACKAGE= -v $$PWD/package.json:/opt/site/package.json \

DOCKER = docker -D

docker_args = \
	    -v $(IN_DIR):/src \
	    -v $(ASSETS_DIR):/assets \
	    -v $(OUT_DIR):/out \
	    $(MOUNT_PACKAGE) \
	    --name $(CTR_NAME) \
	    --workdir $(PACKAGE_DIR) \
	    --entrypoint sh

# quick-and-dirty docker build, for local use
docker-build:
	docker build -f Dockerfile -t $(IMG) .

# real kill target
kill_:
	-$(DOCKER) stop -t 1 $(CTR_NAME) 2>/dev/null
	-$(DOCKER) rm $(CTR_NAME) 2>/dev/null

# silent wrapper of kill_
kill:
	make kill_ 2>/dev/null>/dev/null

pullfirst = -$(DOCKER) pull $(IMG)

# quick-and-dirty serve, for local use
# We use the dev environment
serve: kill
	$(DOCKER) run --rm -it \
	    $(docker_args) \
	    -p 8080:8080 \
	    $(IMG) \
	    -c "$(DEBUG_FLAGS) ELEVENTY_ENV=development eleventy.sh $(PACKAGE_DIR) $(ELEVENTY_JS_FILE) --serve"


# build static site
build: kill
	$(pullfirst)
	$(DOCKER) run --pull --rm \
	    $(docker_args) \
	    $(IMG) \
	    -c "$(DEBUG_FLAGS) $(ENVIRO_FLAGS) eleventy.sh $(PACKAGE_DIR) $(ELEVENTY_JS_FILE)"

docker-shell: kill
	$(pullfirst)
	set -x && docker run --rm -it \
	    $(docker_args) \
	    -p 8080:8080 \
	    $(IMG)

clean:
	sudo rm -rf out/_site

